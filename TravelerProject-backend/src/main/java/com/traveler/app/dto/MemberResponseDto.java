package com.traveler.app.dto;

import java.sql.Timestamp;
import java.util.Date;

import com.traveler.app.entity.Member;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회원 정보 응답 DTO
 * 프론트엔드로 전송할 회원 정보 (비밀번호 등 민감 정보 제외)
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponseDto {
    
    /** 회원 ID */
    private Long mId;
    
    /** 아이디 */
    private String username;
    
    /** 닉네임 */
    private String nickname;
    
    /** 이메일 */
    private String email;
    
    /** 전화번호 */
    private String phone;
    
    /** 성별 */
    private String gender;
    
    /** 생년월일 */
    private Date birth;
    
    /** 권한 */
    private String role;
    
    /** 로그인 타입 */
    private String loginType;
    
    /** 가입일 */
    private Timestamp regdate;
    
    /**
     * Member 엔티티를 MemberResponseDto로 변환
     * 
     * @param member 회원 엔티티
     * @return MemberResponseDto
     */
    public static MemberResponseDto fromEntity(Member member) {
        return MemberResponseDto.builder()
                .mId(member.getMId())
                .username(member.getMUsername())
                .nickname(member.getMNickname())
                .email(member.getMEmail())
                .phone(member.getMPhone())
                .gender(member.getMGender())
                .birth(member.getMBirth())
                .role(member.getMRole())
                .loginType(member.getMLoginType())
                .regdate(member.getMRegdate())
                .build();
    }
}
