package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * 이메일 인증 관련 DTO
 * 이메일 인증 요청 및 확인에 사용되는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerificationDto {
    
	
    /** 이메일 주소 */
	@JsonProperty("email")
    private String email;
    
    /** 인증 코드 (6자리) */
    private String code;
    
    /** 인증 타입 (SIGNUP: 회원가입, FIND_PASSWORD: 비밀번호 찾기) */
    private String type;
    
    
}
