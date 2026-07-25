package com.growtive.money.controller;

import com.growtive.common.exception.UnauthorizedException;
import com.growtive.money.dto.DailyTransactionDto;
import com.growtive.money.service.DailyTransactionService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/money/ledger")
@RequiredArgsConstructor
public class DailyTransactionController {

    private final DailyTransactionService service;

    private Long getUserId(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) throw new UnauthorizedException("로그인이 필요합니다.");
        return userId;
    }

    @GetMapping
    public List<DailyTransactionDto> list(@RequestParam int year,
                                          @RequestParam int month,
                                          HttpSession session) {
        return service.getMonthlyTransactions(getUserId(session), year, month);
    }

    @PostMapping
    public DailyTransactionDto create(@RequestBody DailyTransactionDto dto, HttpSession session) {
        return service.create(getUserId(session), dto);
    }

    @PutMapping("/{id}")
    public DailyTransactionDto update(@PathVariable Long id,
                                      @RequestBody DailyTransactionDto dto,
                                      HttpSession session) {
        return service.update(getUserId(session), id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpSession session) {
        service.delete(getUserId(session), id);
    }
}
