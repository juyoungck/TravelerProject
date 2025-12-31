package com.traveler.app.service;

import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.traveler.app.config.OAuth2Config;
import com.traveler.app.dao.MemberDao;
import com.traveler.app.dto.LoginResponseDto;
import com.traveler.app.dto.MemberResponseDto;
import com.traveler.app.dto.OAuth2UserDto;
import com.traveler.app.entity.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * OAuth2Service
 * 소셜 로그인(카카오, 네이버, 구글) 처리를 담당하는 서비스
 * 
 * DB 수정 없이 기존 컬럼 활용:
 * - m_username: 소셜 ID 저장 (예: KAKAO_123456)
 * - m_login_type: 소셜 타입 저장 (KAKAO, NAVER, GOOGLE)
 * - m_passwd: 소셜 로그인은 빈 문자열
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OAuth2Service {
    
    private final OAuth2Config oauth2Config;
    private final MemberDao memberDao;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    // ============================================
    // 소셜 로그인 URL 생성
    // ============================================
    
    /**
     * 카카오 로그인 URL 생성
     */
    public String getKakaoLoginUrl() {
        return oauth2Config.getKakaoAuthUrl()
                + "?client_id=" + oauth2Config.getKakaoClientId()
                + "&redirect_uri=" + oauth2Config.getKakaoRedirectUri()
                + "&response_type=code";
    }
    
    /**
     * 네이버 로그인 URL 생성
     */
    public String getNaverLoginUrl() {
        String state = UUID.randomUUID().toString();
        return oauth2Config.getNaverAuthUrl()
                + "?client_id=" + oauth2Config.getNaverClientId()
                + "&redirect_uri=" + oauth2Config.getNaverRedirectUri()
                + "&response_type=code"
                + "&state=" + state;
    }
    
    /**
     * 구글 로그인 URL 생성
     */
    public String getGoogleLoginUrl() {
        return oauth2Config.getGoogleAuthUrl()
                + "?client_id=" + oauth2Config.getGoogleClientId()
                + "&redirect_uri=" + oauth2Config.getGoogleRedirectUri()
                + "&response_type=code"
                + "&scope=email%20profile";
    }
    
    // ============================================
    // 소셜 로그인 콜백 처리
    // ============================================
    
    /**
     * 카카오 로그인 콜백 처리
     */
    @Transactional
    public LoginResponseDto kakaoCallback(String code) {
        // 1. 인가 코드로 액세스 토큰 요청
        String accessToken = getKakaoAccessToken(code);
        
        // 2. 액세스 토큰으로 사용자 정보 요청
        OAuth2UserDto userDto = getKakaoUserInfo(accessToken);
        
        // 3. 회원가입 또는 로그인 처리
        return processOAuth2Login(userDto);
    }
    
    /**
     * 네이버 로그인 콜백 처리
     */
    @Transactional
    public LoginResponseDto naverCallback(String code, String state) {
        // 1. 인가 코드로 액세스 토큰 요청
        String accessToken = getNaverAccessToken(code, state);
        
        // 2. 액세스 토큰으로 사용자 정보 요청
        OAuth2UserDto userDto = getNaverUserInfo(accessToken);
        
        // 3. 회원가입 또는 로그인 처리
        return processOAuth2Login(userDto);
    }
    
    /**
     * 구글 로그인 콜백 처리
     */
    @Transactional
    public LoginResponseDto googleCallback(String code) {
        // 1. 인가 코드로 액세스 토큰 요청
        String accessToken = getGoogleAccessToken(code);
        
        // 2. 액세스 토큰으로 사용자 정보 요청
        OAuth2UserDto userDto = getGoogleUserInfo(accessToken);
        
        // 3. 회원가입 또는 로그인 처리
        return processOAuth2Login(userDto);
    }
    
    // ============================================
    // 카카오 OAuth2 처리
    // ============================================
    
    /**
     * 카카오 액세스 토큰 요청
     */
    private String getKakaoAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oauth2Config.getKakaoClientId());
        params.add("client_secret", oauth2Config.getKakaoClientSecret());
        params.add("redirect_uri", oauth2Config.getKakaoRedirectUri());
        params.add("code", code);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    oauth2Config.getKakaoTokenUrl(), request, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("카카오 액세스 토큰 요청 실패", e);
            throw new RuntimeException("카카오 로그인에 실패했습니다.");
        }
    }
    
    /**
     * 카카오 사용자 정보 요청
     */
    private OAuth2UserDto getKakaoUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    oauth2Config.getKakaoUserInfoUrl(), HttpMethod.GET, request, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            String id = jsonNode.get("id").asText();
            JsonNode kakaoAccount = jsonNode.get("kakao_account");
            JsonNode profile = kakaoAccount.get("profile");
            
            // 이메일은 선택적 (비즈앱이 아니면 못 가져올 수 있음)
            String email = null;
            if (kakaoAccount.has("email")) {
                email = kakaoAccount.get("email").asText();
            }
            
            String nickname = "카카오유저";
            if (profile != null && profile.has("nickname")) {
                nickname = profile.get("nickname").asText();
            }
            
            String profileImage = null;
            if (profile != null && profile.has("profile_image_url")) {
                profileImage = profile.get("profile_image_url").asText();
            }
            
            return OAuth2UserDto.builder()
                    .provider("KAKAO")
                    .providerId(id)
                    .email(email)
                    .nickname(nickname)
                    .profileImage(profileImage)
                    .build();
        } catch (Exception e) {
            log.error("카카오 사용자 정보 요청 실패", e);
            throw new RuntimeException("카카오 사용자 정보를 가져올 수 없습니다.");
        }
    }
    
    // ============================================
    // 네이버 OAuth2 처리
    // ============================================
    
    /**
     * 네이버 액세스 토큰 요청
     */
    private String getNaverAccessToken(String code, String state) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oauth2Config.getNaverClientId());
        params.add("client_secret", oauth2Config.getNaverClientSecret());
        params.add("code", code);
        params.add("state", state);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    oauth2Config.getNaverTokenUrl(), request, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("네이버 액세스 토큰 요청 실패", e);
            throw new RuntimeException("네이버 로그인에 실패했습니다.");
        }
    }
    
    /**
     * 네이버 사용자 정보 요청
     */
    private OAuth2UserDto getNaverUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    oauth2Config.getNaverUserInfoUrl(), HttpMethod.GET, request, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            JsonNode responseNode = jsonNode.get("response");
            
            String id = responseNode.get("id").asText();
            String email = responseNode.has("email") ? responseNode.get("email").asText() : null;
            String nickname = responseNode.has("nickname") ? responseNode.get("nickname").asText() : "네이버유저";
            String profileImage = responseNode.has("profile_image") ? responseNode.get("profile_image").asText() : null;
            
            return OAuth2UserDto.builder()
                    .provider("NAVER")
                    .providerId(id)
                    .email(email)
                    .nickname(nickname)
                    .profileImage(profileImage)
                    .build();
        } catch (Exception e) {
            log.error("네이버 사용자 정보 요청 실패", e);
            throw new RuntimeException("네이버 사용자 정보를 가져올 수 없습니다.");
        }
    }
    
    // ============================================
    // 구글 OAuth2 처리
    // ============================================
    
    /**
     * 구글 액세스 토큰 요청
     */
    private String getGoogleAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", oauth2Config.getGoogleClientId());
        params.add("client_secret", oauth2Config.getGoogleClientSecret());
        params.add("redirect_uri", oauth2Config.getGoogleRedirectUri());
        params.add("code", code);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    oauth2Config.getGoogleTokenUrl(), request, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            return jsonNode.get("access_token").asText();
        } catch (Exception e) {
            log.error("구글 액세스 토큰 요청 실패", e);
            throw new RuntimeException("구글 로그인에 실패했습니다.");
        }
    }
    
    /**
     * 구글 사용자 정보 요청
     */
    private OAuth2UserDto getGoogleUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    oauth2Config.getGoogleUserInfoUrl(), HttpMethod.GET, request, String.class);
            
            JsonNode jsonNode = objectMapper.readTree(response.getBody());
            
            String id = jsonNode.get("id").asText();
            String email = jsonNode.has("email") ? jsonNode.get("email").asText() : null;
            String name = jsonNode.has("name") ? jsonNode.get("name").asText() : "구글유저";
            String picture = jsonNode.has("picture") ? jsonNode.get("picture").asText() : null;
            
            return OAuth2UserDto.builder()
                    .provider("GOOGLE")
                    .providerId(id)
                    .email(email)
                    .nickname(name)
                    .profileImage(picture)
                    .build();
        } catch (Exception e) {
            log.error("구글 사용자 정보 요청 실패", e);
            throw new RuntimeException("구글 사용자 정보를 가져올 수 없습니다.");
        }
    }
    
    // ============================================
    // 공통 로그인 처리 (DB 수정 없이!)
    // ============================================
    
    /**
     * OAuth2 로그인 처리 (신규 가입 또는 기존 회원 로그인)
     * 
     * m_username 컬럼에 "KAKAO_123456" 형태로 저장하여 식별
     */
    private LoginResponseDto processOAuth2Login(OAuth2UserDto userDto) {
        // 1. 소셜 ID 생성 (예: KAKAO_123456)
        String socialUsername = userDto.getProvider() + "_" + userDto.getProviderId();
        
        // 2. 기존 회원 조회 (m_username으로 조회)
        Member member = memberDao.selectMemberByUsername(socialUsername);
        
        // 3. 기존 회원이 없으면 신규 가입
        if (member == null) {
            member = createSocialMember(userDto, socialUsername);
        }
        
        // 4. 계정 상태 확인
        if (!"ACTIVE".equals(member.getMStatus())) {
            throw new RuntimeException("비활성화된 계정입니다.");
        }
        
        // 5. JWT 토큰 생성
        String accessToken = jwtService.generateAccessToken(member);
        String refreshToken = jwtService.generateRefreshToken(member);
        
        log.info("소셜 로그인 성공 - provider: {}, 닉네임: {}", userDto.getProvider(), member.getMNickname());
        
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationInSeconds())
                .member(MemberResponseDto.fromEntity(member))
                .build();
    }
    
    /**
     * 소셜 회원 생성 (신규 가입)
     * 
     * 기존 DB 구조 그대로 활용:
     * - m_username: KAKAO_123456 형태
     * - m_login_type: KAKAO, NAVER, GOOGLE
     * - m_passwd: 빈 문자열 (소셜 로그인은 비밀번호 없음)
     */
    private Member createSocialMember(OAuth2UserDto userDto, String socialUsername) {
        // 닉네임 중복 처리
        String nickname = userDto.getNickname();
        if (nickname == null || nickname.isEmpty()) {
            nickname = userDto.getProvider() + "유저";
        }
        
        // 닉네임 중복 시 랜덤 숫자 추가
        if (memberDao.countByNickname(nickname) > 0) {
            nickname = nickname + "_" + UUID.randomUUID().toString().substring(0, 4);
        }
        
        // 이메일 처리 (없으면 더미 이메일 생성)
        String email = userDto.getEmail();
        if (email == null || email.isEmpty()) {
            email = socialUsername.toLowerCase() + "@social.traveler.com";
        }
        
        // 이메일 중복 체크 - 소셜 로그인은 이메일 중복 허용 안 함
        // 같은 이메일로 일반 가입한 계정이 있으면 해당 계정과 연결하지 않고 새로 생성
        // (필요시 이 부분 수정하여 계정 연동 가능)
        if (memberDao.countByEmail(email) > 0) {
            email = socialUsername.toLowerCase() + "@social.traveler.com";
        }
        
        Member member = Member.builder()
                .mUsername(socialUsername)          // KAKAO_123456 형태
                .mPasswd("")                        // 소셜 로그인은 비밀번호 없음
                .mLoginType("SOCIAL")               // DB 제약조건: LOCAL, SOCIAL, BOTH
                .mNickname(nickname)
                .mEmail(email)
                .mRole("USER")
                .mStatus("ACTIVE")
                .build();
        
        memberDao.insertMember(member);
        log.info("소셜 회원가입 완료 - provider: {}, username: {}", userDto.getProvider(), socialUsername);
        
        return memberDao.selectMemberByUsername(socialUsername);
    }
    
    /**
     * 프론트엔드 URL 조회
     */
    public String getFrontendUrl() {
        return oauth2Config.getFrontendUrl();
    }
}
