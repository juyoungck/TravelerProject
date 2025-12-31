package com.traveler.app.service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.traveler.app.dao.MemberDao;
import com.traveler.app.dto.LoginRequestDto;
import com.traveler.app.dto.LoginResponseDto;
import com.traveler.app.dto.MemberResponseDto;
import com.traveler.app.dto.MemberUpdateDto;
import com.traveler.app.dto.PasswordChangeDto;
import com.traveler.app.dto.SignupRequestDto;
import com.traveler.app.entity.Member;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * MemberService
 * 회원 관련 비즈니스 로직을 담당하는 서비스
 * 
 * @author TravelerProject
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {
    
    private final MemberDao memberDao;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * 아이디 중복 체크
     * 
     * @param username 아이디
     * @return 사용 가능 여부 (true: 사용 가능)
     */
    public boolean checkUsernameAvailable(String username) {
        return memberDao.countByUsername(username) == 0;
    }
    
    /**
     * 이메일 중복 체크
     * 
     * @param email 이메일
     * @return 사용 가능 여부 (true: 사용 가능)
     */
    public boolean checkEmailAvailable(String email) {
        return memberDao.countByEmail(email) == 0;
    }
    
    /**
     * 닉네임 중복 체크
     * 
     * @param nickname 닉네임
     * @return 사용 가능 여부 (true: 사용 가능)
     */
    public boolean checkNicknameAvailable(String nickname) {
        return memberDao.countByNickname(nickname) == 0;
    }
    
    /**
     * 회원가입
     * 
     * @param request 회원가입 요청 정보
     * @return 가입된 회원 정보
     */
    @Transactional
    public MemberResponseDto signup(SignupRequestDto request) {
        // 1. 유효성 검증
        validateSignupRequest(request);
        
        // 2. 이메일 인증 확인
        if (!emailService.isEmailVerified(request.getEmail())) {
            throw new RuntimeException("이메일 인증이 완료되지 않았습니다.");
        }
        
        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // 4. 생년월일 파싱
        Date birth = parseBirthDate(request.getBirth());
        
        // 5. Member 엔티티 생성
        Member member = Member.builder()
                .mUsername(request.getUsername())
                .mPasswd(encodedPassword)
                .mLoginType("LOCAL")
                .mNickname(request.getNickname())
                .mEmail(request.getEmail())
                .mPhone(request.getPhone())
                .mGender(request.getGender())
                .mBirth(birth)
                .mRole("USER")
                .mStatus("ACTIVE")
                .build();
        
        // 6. DB 저장
        memberDao.insertMember(member);
        log.info("회원가입 완료 - 아이디: {}, 이메일: {}", member.getMUsername(), member.getMEmail());
        
        return MemberResponseDto.fromEntity(member);
    }
    
    /**
     * 로그인
     * 
     * @param request 로그인 요청 정보
     * @return 로그인 응답 (토큰 포함)
     */
    public LoginResponseDto login(LoginRequestDto request) {
        // 1. 회원 조회
        Member member = memberDao.selectMemberByUsername(request.getUsername());
        
        if (member == null) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        
        // 2. 비밀번호 검증
        if (!passwordEncoder.matches(request.getPassword(), member.getMPasswd())) {
            throw new RuntimeException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        
        // 3. 계정 상태 확인
        if (!"ACTIVE".equals(member.getMStatus())) {
            throw new RuntimeException("비활성화된 계정입니다.");
        }
        
        // 4. JWT 토큰 생성
        String accessToken = jwtService.generateAccessToken(member);
        String refreshToken = jwtService.generateRefreshToken(member);
        
        log.info("로그인 성공 - 아이디: {}", member.getMUsername());
        
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationInSeconds())
                .member(MemberResponseDto.fromEntity(member))
                .build();
    }
    
    /**
     * 로그아웃
     * 
     * @param refreshToken 리프레시 토큰
     */
    public void logout(String refreshToken) {
        jwtService.logout(refreshToken);
        log.info("로그아웃 완료");
    }
    
    /**
     * Access Token 갱신
     * 
     * @param refreshToken 리프레시 토큰
     * @return 새 Access Token
     */
    public String refreshAccessToken(String refreshToken) {
        // 리프레시 토큰 검증
        if (!jwtService.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("유효하지 않은 Refresh Token입니다.");
        }
        
        // 회원 정보 조회
        Long memberId = jwtService.getMemberIdFromToken(refreshToken);
        Member member = memberDao.selectMemberById(memberId);
        
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        
        // 새 Access Token 발급
        return jwtService.generateAccessToken(member);
    }
    
    /**
     * 회원 정보 조회
     * 
     * @param mId 회원 ID
     * @return 회원 정보
     */
    public MemberResponseDto getMemberInfo(Long mId) {
        Member member = memberDao.selectMemberById(mId);
        
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        
        return MemberResponseDto.fromEntity(member);
    }
    
    /**
     * 회원 정보 수정
     * 
     * @param mId 회원 ID
     * @param request 수정 요청 정보
     * @return 수정된 회원 정보
     */
    @Transactional
    public MemberResponseDto updateMember(Long mId, MemberUpdateDto request) {
        Member member = memberDao.selectMemberById(mId);
        
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        
        // 닉네임 변경 시 중복 체크
        if (request.getNickname() != null && !request.getNickname().equals(member.getMNickname())) {
            if (!checkNicknameAvailable(request.getNickname())) {
                throw new RuntimeException("이미 사용 중인 닉네임입니다.");
            }
            member.setMNickname(request.getNickname());
        }
        
        // 전화번호 변경
        if (request.getPhone() != null) {
            member.setMPhone(request.getPhone());
        }
        
        memberDao.updateMember(member);
        log.info("회원정보 수정 완료 - 회원ID: {}", mId);
        
        return MemberResponseDto.fromEntity(member);
    }
    
    /**
     * 비밀번호 변경
     * 
     * @param mId 회원 ID
     * @param request 비밀번호 변경 요청
     */
    @Transactional
    public void changePassword(Long mId, PasswordChangeDto request) {
        Member member = memberDao.selectMemberById(mId);
        
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), member.getMPasswd())) {
            throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 새 비밀번호 확인
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new RuntimeException("새 비밀번호가 일치하지 않습니다.");
        }
        
        // 비밀번호 업데이트
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        memberDao.updatePassword(mId, encodedPassword);
        
        // 모든 세션 로그아웃 (보안)
        jwtService.logoutAll(mId);
        
        log.info("비밀번호 변경 완료 - 회원ID: {}", mId);
    }
    
    /**
     * 아이디 찾기
     * 
     * @param email 이메일
     * @return 아이디 발송 성공 여부
     */
    public boolean findUsername(String email) {
        Member member = memberDao.selectMemberForFindId(email);
        
        if (member == null) {
            throw new RuntimeException("해당 이메일로 가입된 계정이 없습니다.");
        }
        
        // 이메일로 아이디 전송
        boolean sent = emailService.sendFoundUsername(email, member.getMUsername());
        
        if (sent) {
            log.info("아이디 찾기 이메일 발송 - 이메일: {}", email);
        }
        
        return sent;
    }
    
    /**
     * 비밀번호 찾기 - 본인 확인
     * 
     * @param username 아이디
     * @param email 이메일
     * @return 인증 코드 발송 성공 여부
     */
    public boolean findPasswordVerify(String username, String email) {
        Member member = memberDao.selectMemberForFindPassword(username, email);
        
        if (member == null) {
            throw new RuntimeException("일치하는 회원 정보가 없습니다.");
        }
        
        // 인증 코드 발송
        boolean sent = emailService.sendPasswordResetCode(email);
        
        if (sent) {
            log.info("비밀번호 찾기 인증 코드 발송 - 아이디: {}, 이메일: {}", username, email);
        }
        
        return sent;
    }
    
    /**
     * 비밀번호 재설정
     * 
     * @param request 비밀번호 재설정 요청
     */
    @Transactional
    public void resetPassword(PasswordChangeDto request) {
        // 인증 코드 검증
        if (!emailService.verifyCode(request.getEmail(), request.getVerificationCode())) {
            throw new RuntimeException("인증 코드가 유효하지 않습니다.");
        }
        
        // 회원 조회
        Member member = memberDao.selectMemberForFindPassword(request.getUsername(), request.getEmail());
        
        if (member == null) {
            throw new RuntimeException("일치하는 회원 정보가 없습니다.");
        }
        
        // 새 비밀번호 확인
        if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
            throw new RuntimeException("새 비밀번호가 일치하지 않습니다.");
        }
        
        // 비밀번호 업데이트
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        memberDao.updatePassword(member.getMId(), encodedPassword);
        
        // 모든 세션 로그아웃
        jwtService.logoutAll(member.getMId());
        
        log.info("비밀번호 재설정 완료 - 아이디: {}", request.getUsername());
    }
    
    /**
     * 회원 탈퇴
     * 
     * @param mId 회원 ID
     * @param password 비밀번호 확인
     */
    @Transactional
    public void withdraw(Long mId, String password) {
        Member member = memberDao.selectMemberById(mId);
        
        if (member == null) {
            throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
        }
        
        // 비밀번호 확인
        if (!passwordEncoder.matches(password, member.getMPasswd())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        
        // 상태 변경 (soft delete)
        memberDao.updateMemberStatus(mId, "DELETED");
        
        // 모든 세션 로그아웃
        jwtService.logoutAll(mId);
        
        log.info("회원 탈퇴 완료 - 회원ID: {}", mId);
    }
    
    /**
     * 회원가입 요청 유효성 검증
     * 
     * @param request 회원가입 요청
     */
    private void validateSignupRequest(SignupRequestDto request) {
        // 아이디 중복 체크
        if (!checkUsernameAvailable(request.getUsername())) {
            throw new RuntimeException("이미 사용 중인 아이디입니다.");
        }
        
        // 이메일 중복 체크
        if (!checkEmailAvailable(request.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }
        
        // 닉네임 중복 체크
        if (!checkNicknameAvailable(request.getNickname())) {
            throw new RuntimeException("이미 사용 중인 닉네임입니다.");
        }
        
        // 비밀번호 확인
        if (!request.getPassword().equals(request.getPasswordConfirm())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }
        
        // 비밀번호 규칙 검증 (8자 이상)
        if (request.getPassword().length() < 8) {
            throw new RuntimeException("비밀번호는 8자 이상이어야 합니다.");
        }
    }
    
    /**
     * 생년월일 문자열 파싱
     * 
     * @param birth 생년월일 문자열 (yyyy-MM-dd)
     * @return Date 객체
     */
    private Date parseBirthDate(String birth) {
        if (birth == null || birth.isEmpty()) {
            return null;
        }
        
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            return sdf.parse(birth);
        } catch (ParseException e) {
            log.warn("생년월일 파싱 실패: {}", birth);
            return null;
        }
    }
}
