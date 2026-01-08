package com.traveler.app.entity;

import java.sql.Timestamp;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Member 엔티티
 * 회원 테이블(member)과 매핑되는 클래스
 * 
 * @author TravelerProject
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
    
    /** 회원 ID (PK) */
    private Long mId;
    
    /** 아이디 (소셜 전용 시 NULL 가능) */
    private String mUsername;
    
    /** 비밀번호 (암호화 저장, 소셜 전용 시 NULL 가능) */
    private String mPasswd;
    
    /** 로그인 타입 (LOCAL/SOCIAL/BOTH) */
    private String mLoginType;
    
    /** 닉네임 */
    private String mNickname;
    
    /** 이메일 */
    private String mEmail;
    
    /** 전화번호 */
    private String mPhone;
    
    /** 성별 (M/F/OTHER) */
    private String mGender;
    
    /** 생년월일 */
    private Date mBirth;
    
    /** 권한 (USER/ADMIN) */
    private String mRole;
    
    /** 상태 (ACTIVE/DELETED) */
    private String mStatus;
    
    /** 가입일 */
    private Timestamp mRegdate;
    
    /** 비밀번호 수정일 */
    private Timestamp mPasswdDate;
    
    /** 탈퇴일 (soft delete) */
    private Timestamp mDeldate;
}
