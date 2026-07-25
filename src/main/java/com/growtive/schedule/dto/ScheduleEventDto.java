package com.growtive.schedule.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ScheduleEventDto {

    private Long id;

    /**
     * 일정 시작일 (yyyy-MM-dd)
     */
    private LocalDate startDate;

    /**
     * 일정 종료일 (yyyy-MM-dd). 하루짜리 일정이면 startDate와 동일.
     */
    private LocalDate endDate;

    /**
     * 일정 시간 (선택, HH:mm)
     */
    private LocalTime time;

    private String title;

    private String memo;

    /**
     * 색상 태그 (blue / indigo / purple / pink / red / orange / yellow / green / teal / gray)
     */
    private String colorTag;

    /**
     * 친구와 캘린더 비교 시 이 일정을 숨길지 여부.
     */
    private boolean hidden;
}
