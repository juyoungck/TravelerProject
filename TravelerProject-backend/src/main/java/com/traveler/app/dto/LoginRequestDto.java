package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그인 요청 DTO
 * 프론트엔드에서 전송하는 로그인 데이터를 담는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {
    
    /** 아이디 */
    private String username;
    
    /** 비밀번호 */
    private String password;
}
