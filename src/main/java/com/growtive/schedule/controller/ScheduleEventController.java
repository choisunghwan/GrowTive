package com.growtive.schedule.controller;

import com.growtive.common.exception.UnauthorizedException;
import com.growtive.schedule.dto.ScheduleEventDto;
import com.growtive.schedule.service.ScheduleEventService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleEventController {

    private final ScheduleEventService service;

    private Long getUserId(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) throw new UnauthorizedException("로그인이 필요합니다.");
        return userId;
    }

    @GetMapping
    public List<ScheduleEventDto> list(@RequestParam int year,
                                        @RequestParam int month,
                                        HttpSession session) {
        return service.getMonthlyEvents(getUserId(session), year, month);
    }

    @PostMapping
    public ScheduleEventDto create(@RequestBody ScheduleEventDto dto, HttpSession session) {
        return service.create(getUserId(session), dto);
    }

    @PutMapping("/{id}")
    public ScheduleEventDto update(@PathVariable Long id,
                                    @RequestBody ScheduleEventDto dto,
                                    HttpSession session) {
        return service.update(getUserId(session), id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpSession session) {
        service.delete(getUserId(session), id);
    }
}
