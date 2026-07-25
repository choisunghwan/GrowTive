package com.growtive.schedule.service;

import com.growtive.common.exception.BadRequestException;
import com.growtive.common.exception.NotFoundException;
import com.growtive.schedule.dto.ScheduleEventDto;
import com.growtive.schedule.mapper.ScheduleEventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleEventServiceImpl implements ScheduleEventService {

    private final ScheduleEventMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleEventDto> getMonthlyEvents(Long userId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        return mapper.findOverlapping(userId, ym.atDay(1), ym.atEndOfMonth());
    }

    private void validateRange(ScheduleEventDto dto) {
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("종료일은 시작일보다 빠를 수 없습니다.");
        }
    }

    @Override
    @Transactional
    public ScheduleEventDto create(Long userId, ScheduleEventDto dto) {
        validateRange(dto);
        mapper.insert(userId, dto);
        return dto;
    }

    @Override
    @Transactional
    public ScheduleEventDto update(Long userId, Long id, ScheduleEventDto dto) {
        if (mapper.findById(id, userId) == null) {
            throw new NotFoundException("일정을 찾을 수 없습니다: id=" + id);
        }
        validateRange(dto);
        mapper.update(id, userId, dto);
        dto.setId(id);
        return dto;
    }

    @Override
    @Transactional
    public void delete(Long userId, Long id) {
        if (mapper.findById(id, userId) == null) {
            throw new NotFoundException("일정을 찾을 수 없습니다: id=" + id);
        }
        mapper.delete(id, userId);
    }
}
