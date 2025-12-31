package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 비밀번호 변경 요청 DTO
 * 비밀번호 찾기/변경 시 사용되는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordChangeDto {
    
    /** 아이디 (비밀번호 찾기 시) */
    private String username;
    
    /** 이메일 (비밀번호 찾기 시) */
    private String email;
    
    /** 현재 비밀번호 (비밀번호 변경 시) */
    private String currentPassword;
    
    /** 새 비밀번호 */
    private String newPassword;
    
    /** 새 비밀번호 확인 */
    private String newPasswordConfirm;
    
    /** 인증 코드 (비밀번호 찾기 시) */
    private String verificationCode;
}
