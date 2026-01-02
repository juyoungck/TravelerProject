package com.traveler.app.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.traveler.app.entity.SocialAccount;

/**
 * SocialAccountDao
 * 소셜 계정 연동 DAO
 * 
 * @author TravelerProject
 */
@Mapper
public interface SocialAccountDao {
    
    /** 소셜 계정 연동 추가 */
    void insertSocialAccount(SocialAccount socialAccount);
    
    /** 회원 ID로 연동된 소셜 계정 목록 조회 */
    List<SocialAccount> selectByMemberId(Long mId);
    
    /** 제공자 + 제공자ID로 조회 (이미 연동된 계정인지 확인) */
    SocialAccount selectByProviderAndProviderId(
        @Param("provider") String provider, 
        @Param("providerId") String providerId
    );
    
    /** 회원 ID + 제공자로 조회 */
    SocialAccount selectByMemberIdAndProvider(
        @Param("mId") Long mId, 
        @Param("provider") String provider
    );
}
