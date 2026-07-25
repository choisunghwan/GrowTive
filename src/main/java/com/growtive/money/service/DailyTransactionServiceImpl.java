package com.growtive.money.service;

import com.growtive.common.exception.NotFoundException;
import com.growtive.money.dto.DailyTransactionDto;
import com.growtive.money.mapper.DailyTransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyTransactionServiceImpl implements DailyTransactionService {

    private final DailyTransactionMapper mapper;

    @Override
    @Transactional
    public List<DailyTransactionDto> getMonthlyTransactions(Long userId, int year, int month) {
        ensureRecurringOccurrences(userId, year, month);
        return mapper.findByMonth(userId, year, month);
    }

    /**
     * 활성 반복 원본 항목 중 이 달에 아직 occurrence가 없는 것을 찾아 생성한다.
     * (financial_node_snapshot의 월별 스냅샷 생성 패턴과 동일한 "조회 시점에 보장" 방식)
     */
    private void ensureRecurringOccurrences(Long userId, int year, int month) {
        YearMonth targetMonth = YearMonth.of(year, month);
        List<DailyTransactionDto> origins = mapper.findActiveRecurringOrigins(userId, targetMonth.atEndOfMonth());

        for (DailyTransactionDto origin : origins) {
            YearMonth originMonth = YearMonth.from(origin.getDate());
            if (!targetMonth.isAfter(originMonth)) {
                continue;
            }
            if (mapper.countOccurrenceForOriginInMonth(origin.getId(), year, month) > 0) {
                continue;
            }

            int day = Math.min(origin.getDate().getDayOfMonth(), targetMonth.lengthOfMonth());
            DailyTransactionDto occurrence = new DailyTransactionDto();
            occurrence.setDate(targetMonth.atDay(day));
            occurrence.setType(origin.getType());
            occurrence.setCategory(origin.getCategory());
            occurrence.setAmount(origin.getAmount());
            occurrence.setMemo(origin.getMemo());
            occurrence.setRecurring(true);
            occurrence.setRecurringOriginId(origin.getId());
            mapper.insert(userId, occurrence);
        }
    }

    @Override
    @Transactional
    public DailyTransactionDto create(Long userId, DailyTransactionDto dto) {
        mapper.insert(userId, dto);
        return dto;
    }

    @Override
    @Transactional
    public DailyTransactionDto update(Long userId, Long id, DailyTransactionDto dto) {
        if (mapper.findById(id, userId) == null) {
            throw new NotFoundException("거래 내역을 찾을 수 없습니다: id=" + id);
        }
        mapper.update(id, userId, dto);
        dto.setId(id);
        return dto;
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        if (mapper.findById(id, userId) == null) {
            throw new NotFoundException("거래 내역을 찾을 수 없습니다: id=" + id);
        }
        mapper.delete(id, userId);
    }
}
