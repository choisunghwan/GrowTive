package com.growtive.friend.mapper;

import lombok.Data;

/**
 * username으로 사용자를 찾을 때 필요한 최소 정보 (password 등은 절대 조회하지 않음)
 */
@Data
public class UserBasic {

    private Long id;
    private String username;
    private String displayName;
}
