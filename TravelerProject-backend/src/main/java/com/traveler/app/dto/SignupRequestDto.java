package com.traveler.app.dto;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회원가입 요청 DTO
 * 프론트엔드에서 전송하는 회원가입 데이터를 담는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {
    
    /** 아이디 */
    private String username;
    
    /** 비밀번호 */
    private String password;
    
    /** 비밀번호 확인 */
    private String passwordConfirm;
    
    /** 닉네임 */
    private String nickname;
    
    /** 이메일 */
    private String email;
    
    /** 전화번호 */
    private String phone;
    
    /** 성별 (M/F/OTHER) */
    private String gender;
    
    /** 생년월일 (yyyy-MM-dd 형식) */
    private String birth;
    
    /** 이메일 인증 코드 */
    private String verificationCode;
}
