package com.growtive.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

/**
 * 실시간 급여 카운터에 쓰이는 근무 스케줄 (근무 시작/종료 시간, 근무 요일)
 */
@Getter
@Setter
public class WorkScheduleDto {

    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private String workDays; // 예: "MON,TUE,WED,THU,FRI"

}
