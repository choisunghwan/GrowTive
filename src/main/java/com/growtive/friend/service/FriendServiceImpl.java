package com.growtive.friend.service;

import com.growtive.common.exception.BadRequestException;
import com.growtive.common.exception.ForbiddenException;
import com.growtive.common.exception.NotFoundException;
import com.growtive.friend.dto.FriendCalendarSummaryDto;
import com.growtive.friend.dto.FriendConnectionDto;
import com.growtive.friend.mapper.FriendConnectionRow;
import com.growtive.friend.mapper.FriendMapper;
import com.growtive.friend.mapper.UserBasic;
import com.growtive.money.dto.DailyTransactionDto;
import com.growtive.money.mapper.DailyTransactionMapper;
import com.growtive.schedule.dto.ScheduleEventDto;
import com.growtive.schedule.mapper.ScheduleEventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendMapper mapper;
    private final DailyTransactionMapper dailyTransactionMapper;
    private final ScheduleEventMapper scheduleEventMapper;

    @Override
    @Transactional
    public FriendConnectionDto createRequest(Long userId, String targetUsername) {
        UserBasic target = mapper.findUserBasicByUsername(targetUsername);
        if (target == null) {
            throw new NotFoundException("사용자를 찾을 수 없습니다: " + targetUsername);
        }
        if (target.getId().equals(userId)) {
            throw new BadRequestException("자기 자신에게는 친구 요청을 보낼 수 없습니다.");
        }
        if (mapper.countExistingBetween(userId, target.getId()) > 0) {
            throw new BadRequestException("이미 요청했거나 이미 친구인 사용자입니다.");
        }

        FriendConnectionRow row = new FriendConnectionRow();
        row.setRequesterId(userId);
        row.setAddresseeId(target.getId());
        mapper.insertRequest(row);

        FriendConnectionDto dto = new FriendConnectionDto();
        dto.setId(row.getId());
        dto.setOtherUserId(target.getId());
        dto.setOtherUsername(target.getUsername());
        dto.setOtherDisplayName(target.getDisplayName());
        dto.setStatus("PENDING");
        dto.setCreatedAt(LocalDateTime.now());
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendConnectionDto> getIncoming(Long userId) {
        return mapper.findIncoming(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendConnectionDto> getOutgoing(Long userId) {
        return mapper.findOutgoing(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FriendConnectionDto> getFriends(Long userId) {
        return mapper.findAccepted(userId);
    }

    @Override
    @Transactional
    public void accept(Long userId, Long connectionId) {
        FriendConnectionRow row = mapper.findById(connectionId);
        if (row == null) {
            throw new NotFoundException("요청을 찾을 수 없습니다: id=" + connectionId);
        }
        if (!row.getAddresseeId().equals(userId)) {
            throw new ForbiddenException("본인에게 온 요청만 수락할 수 있습니다.");
        }
        if (!"PENDING".equals(row.getStatus())) {
            throw new BadRequestException("이미 처리된 요청입니다.");
        }
        mapper.updateStatus(connectionId, "ACCEPTED");
    }

    @Override
    @Transactional
    public void remove(Long userId, Long connectionId) {
        FriendConnectionRow row = mapper.findById(connectionId);
        if (row == null) {
            throw new NotFoundException("연결을 찾을 수 없습니다: id=" + connectionId);
        }
        if (!row.getRequesterId().equals(userId) && !row.getAddresseeId().equals(userId)) {
            throw new ForbiddenException("본인과 관련된 연결만 해제할 수 있습니다.");
        }
        mapper.deleteById(connectionId);
    }

    @Override
    @Transactional
    public void setSharesRange(Long userId, Long connectionId, LocalDate sharesFrom, LocalDate sharesUntil) {
        FriendConnectionRow row = mapper.findById(connectionId);
        if (row == null) {
            throw new NotFoundException("연결을 찾을 수 없습니다: id=" + connectionId);
        }
        boolean bothNull = sharesFrom == null && sharesUntil == null;
        boolean bothSet = sharesFrom != null && sharesUntil != null;
        if (!bothNull && !bothSet) {
            throw new BadRequestException("공유 시작일과 종료일을 모두 입력하거나, 둘 다 비워서 공유를 취소해주세요.");
        }
        if (bothSet && sharesUntil.isBefore(sharesFrom)) {
            throw new BadRequestException("종료일은 시작일보다 빠를 수 없습니다.");
        }

        if (row.getRequesterId().equals(userId)) {
            mapper.updateRequesterSharesRange(connectionId, sharesFrom, sharesUntil);
        } else if (row.getAddresseeId().equals(userId)) {
            mapper.updateAddresseeSharesRange(connectionId, sharesFrom, sharesUntil);
        } else {
            throw new ForbiddenException("본인과 관련된 연결만 설정할 수 있습니다.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public FriendCalendarSummaryDto getFriendCalendar(Long viewerId, Long connectionId, int year, int month) {
        FriendConnectionRow row = mapper.findById(connectionId);
        if (row == null) {
            throw new NotFoundException("연결을 찾을 수 없습니다: id=" + connectionId);
        }
        if (!"ACCEPTED".equals(row.getStatus())) {
            throw new BadRequestException("아직 수락되지 않은 연결입니다.");
        }
        if (!row.isBothConfigured()) {
            throw new BadRequestException("아직 서로 공유 기간을 설정하지 않았습니다. 두 사람 모두 공유 기간을 설정해야 비교할 수 있습니다.");
        }

        Long friendId;
        LocalDate sinceDate;
        LocalDate untilDate;
        if (row.getRequesterId().equals(viewerId)) {
            friendId = row.getAddresseeId();
            sinceDate = row.getAddresseeSharesFrom();
            untilDate = row.getAddresseeSharesUntil();
        } else if (row.getAddresseeId().equals(viewerId)) {
            friendId = row.getRequesterId();
            sinceDate = row.getRequesterSharesFrom();
            untilDate = row.getRequesterSharesUntil();
        } else {
            throw new ForbiddenException("본인과 관련된 연결만 조회할 수 있습니다.");
        }

        UserBasic friend = mapper.findUserBasicById(friendId);

        List<DailyTransactionDto> transactions = dailyTransactionMapper.findVisibleByMonth(friendId, year, month, sinceDate, untilDate);

        YearMonth ym = YearMonth.of(year, month);
        List<ScheduleEventDto> events = scheduleEventMapper.findVisibleOverlapping(friendId, ym.atDay(1), ym.atEndOfMonth(), sinceDate, untilDate);

        long totalIncome = transactions.stream()
                .filter(t -> "INCOME".equals(t.getType()))
                .mapToLong(DailyTransactionDto::getAmount)
                .sum();
        long totalExpense = transactions.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .mapToLong(DailyTransactionDto::getAmount)
                .sum();

        return new FriendCalendarSummaryDto(
                friendId, friend.getUsername(), friend.getDisplayName(),
                totalIncome, totalExpense, transactions, events
        );
    }
}
