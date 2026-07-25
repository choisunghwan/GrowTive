package com.growtive.schedule.mapper;

import com.growtive.schedule.dto.ScheduleEventDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface ScheduleEventMapper {

    /** 특정 월과 겹치는(기간이 걸쳐 있는 것 포함) 전체 일정 목록 (본인 소유만) */
    List<ScheduleEventDto> findOverlapping(@Param("userId") Long userId,
                                           @Param("monthStart") LocalDate monthStart,
                                           @Param("monthEnd") LocalDate monthEnd);

    /** 단건 조회 (본인 소유일 때만) */
    ScheduleEventDto findById(@Param("id") Long id, @Param("userId") Long userId);

    int insert(@Param("userId") Long userId, @Param("dto") ScheduleEventDto dto);

    int update(@Param("id") Long id, @Param("userId") Long userId, @Param("dto") ScheduleEventDto dto);

    int delete(@Param("id") Long id, @Param("userId") Long userId);

    /** 친구 캘린더 비교용: 숨긴 항목 제외, sinceDate~untilDate 범위 내만 */
    List<ScheduleEventDto> findVisibleOverlapping(@Param("userId") Long userId,
                                                  @Param("monthStart") LocalDate monthStart,
                                                  @Param("monthEnd") LocalDate monthEnd,
                                                  @Param("sinceDate") LocalDate sinceDate,
                                                  @Param("untilDate") LocalDate untilDate);
}
