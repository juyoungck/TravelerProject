package com.traveler.app.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.MemberDao;
import com.traveler.app.dao.SocialAccountDao;
import com.traveler.app.dto.OAuth2UserDto;
import com.traveler.app.dto.SocialLinkDto;
import com.traveler.app.entity.Member;
import com.traveler.app.entity.SocialAccount;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * SocialLinkService
 * 소셜 계정 연동 서비스
 * 
 * 플로우:
 * 1. 소셜 로그인 진행
 * 2. 이미 가입된 소셜 계정인지 확인
 * 3. 닉네임 선택 (기존 유지 or 소셜 닉네임)
 * 4. 연동 완료
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SocialLinkService {
    
    private final SocialAccountDao socialAccountDao;
    private final MemberDao memberDao;
    
    /**
     * 회원의 소셜 연동 상태 조회
     * 
     * @param mId 회원 ID
     * @return 각 소셜 제공자별 연동 상태
     */
    public List<SocialLinkDto> getSocialLinkStatus(Long mId) {
        List<SocialAccount> linkedAccounts = socialAccountDao.selectByMemberId(mId);
        List<SocialLinkDto> result = new ArrayList<>();
        
        // 카카오
        SocialLinkDto kakao = SocialLinkDto.builder()
                .provider("KAKAO")
                .linked(false)
                .build();
        
        // 네이버
        SocialLinkDto naver = SocialLinkDto.builder()
                .provider("NAVER")
                .linked(false)
                .build();
        
        // 구글
        SocialLinkDto google = SocialLinkDto.builder()
                .provider("GOOGLE")
                .linked(false)
                .build();
        
        // 연동된 계정 체크
        for (SocialAccount account : linkedAccounts) {
            switch (account.getSaProvider()) {
                case "KAKAO":
                    kakao.setLinked(true);
                    kakao.setSocialNickname(account.getSaNickname());
                    kakao.setSocialEmail(account.getSaEmail());
                    break;
                case "NAVER":
                    naver.setLinked(true);
                    naver.setSocialNickname(account.getSaNickname());
                    naver.setSocialEmail(account.getSaEmail());
                    break;
                case "GOOGLE":
                    google.setLinked(true);
                    google.setSocialNickname(account.getSaNickname());
                    google.setSocialEmail(account.getSaEmail());
                    break;
            }
        }
        
        result.add(kakao);
        result.add(naver);
        result.add(google);
        
        return result;
    }
    
    /**
     * 소셜 계정이 이미 다른 회원에게 연동되어 있는지 확인
     * 
     * @param provider 제공자
     * @param providerId 제공자 고유 ID
     * @return 이미 연동된 경우 true
     */
    public boolean isAlreadyLinked(String provider, String providerId) {
        SocialAccount existing = socialAccountDao.selectByProviderAndProviderId(provider, providerId);
        return existing != null;
    }
    
    /**
     * 소셜 계정이 이미 회원가입에 사용되었는지 확인
     * (소셜 전용 계정으로 가입한 경우)
     * 
     * @param provider 제공자
     * @param providerId 제공자 고유 ID
     * @return 이미 가입된 경우 true
     */
    public boolean isAlreadyRegistered(String provider, String providerId) {
        String socialUsername = provider + "_" + providerId;
        Member member = memberDao.selectMemberByUsername(socialUsername);
        return member != null;
    }
    
    /**
     * 소셜 계정 연동
     * 
     * @param mId 회원 ID
     * @param userDto 소셜 사용자 정보
     * @param useSocialNickname 소셜 닉네임 사용 여부
     */
    @Transactional
    public void linkSocialAccount(Long mId, OAuth2UserDto userDto, boolean useSocialNickname) {
        // 1. 이미 다른 회원에게 연동된 소셜 계정인지 확인
        if (isAlreadyLinked(userDto.getProvider(), userDto.getProviderId())) {
            throw new RuntimeException("이미 다른 계정에 연동된 소셜 계정입니다.");
        }
        
        // 2. 이미 소셜 전용으로 가입된 계정인지 확인
        if (isAlreadyRegistered(userDto.getProvider(), userDto.getProviderId())) {
            throw new RuntimeException("이미 가입된 소셜 계정입니다.");
        }
        
        // 3. 회원 정보 조회
        Member member = memberDao.selectMemberById(mId);
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        
        // ★★★ 이 부분 추가 ★★★
        // 4. 소셜 전용 계정은 연동 불가
        if ("SOCIAL".equals(member.getMLoginType())) {
        	throw new RuntimeException("소셜 계정으로 가입한 회원은 추가 소셜 연동이 불가능합니다.");
        }
        
        // 4. 소셜 닉네임 사용 선택 시 닉네임 업데이트
        if (useSocialNickname && userDto.getNickname() != null) {
            String newNickname = userDto.getNickname();
            
            // 닉네임 중복 체크
            if (memberDao.countByNickname(newNickname) > 0) {
                // 중복이면 랜덤 숫자 추가
                newNickname = newNickname + "_" + System.currentTimeMillis() % 10000;
            }
            
            member.setMNickname(newNickname);
            memberDao.updateMember(member);
        }
        
        // 5. 회원 로그인 타입 변경 (LOCAL → BOTH)
        if ("LOCAL".equals(member.getMLoginType())) {
            memberDao.updateMemberLoginType(mId, "BOTH");
        }
        
        // 6. 소셜 계정 연동 정보 저장
        SocialAccount socialAccount = SocialAccount.builder()
                .mId(mId)
                .saProvider(userDto.getProvider())
                .saProviderId(userDto.getProviderId())
                .saEmail(userDto.getEmail())
                .saNickname(userDto.getNickname())
                .build();
        
        socialAccountDao.insertSocialAccount(socialAccount);
        
        log.info("소셜 계정 연동 완료 - 회원ID: {}, 제공자: {}", mId, userDto.getProvider());
    }
    
    /**
     * 특정 제공자 연동 여부 확인
     * 
     * @param mId 회원 ID
     * @param provider 제공자
     * @return 연동 여부
     */
    public boolean isLinked(Long mId, String provider) {
        SocialAccount account = socialAccountDao.selectByMemberIdAndProvider(mId, provider);
        return account != null;
    }
}
