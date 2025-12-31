package com.traveler.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회원정보 수정 요청 DTO
 * 마이페이지에서 회원정보 수정 시 사용되는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberUpdateDto {
    
    /** 닉네임 (변경할 경우) */
    private String nickname;
    
    /** 전화번호 (변경할 경우) */
    private String phone;
}
