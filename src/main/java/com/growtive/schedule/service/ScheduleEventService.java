package com.growtive.schedule.service;

import com.growtive.schedule.dto.ScheduleEventDto;

import java.util.List;

public interface ScheduleEventService {

    List<ScheduleEventDto> getMonthlyEvents(Long userId, int year, int month);

    ScheduleEventDto create(Long userId, ScheduleEventDto dto);

    ScheduleEventDto update(Long userId, Long id, ScheduleEventDto dto);

    void delete(Long userId, Long id);
}
