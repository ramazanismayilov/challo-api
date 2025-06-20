import { MailerService } from "@nestjs-modules/mailer";
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/entities/User.entity";
import { DataSource, Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import { UserRole } from "src/common/enums/role.enum";
import { generateOtpExpireDate, generateOtpNumber } from "src/common/utils/randomNumber.utils";
import { UserStatus } from "src/common/enums/userStatus.enum";
import { VerifyOtpDto } from "./dto/verify.dto";
import { LoginDto } from "./dto/login.dto";
import { v4 } from 'uuid'
import { ResentOtpDto } from "./dto/resent-otp.dto";
import { RefreshTokenDto } from "./dto/refreshToken.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
    private userRepo: Repository<UserEntity>

    constructor(
        private jwt: JwtService,
        private cls: ClsService,
        private mailer: MailerService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity)
    }

    async login(params: LoginDto) {
        let user = await this.userRepo.findOne({ where: { email: params.email } })
        if (!user) throw new UnauthorizedException('Email or passsword is wrong')
        if (!user.isVerified) throw new ForbiddenException('Account is not verified');

        let checkPassword = await bcrypt.compare(params.password, user.password);
        if (!checkPassword) throw new UnauthorizedException('Email or passsword is wrong');

        let accessToken = this.jwt.sign({ userId: user.id }, { expiresIn: '15m' });
        const refreshToken = v4()
        const refreshTokenDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        user.refreshToken = refreshToken;
        user.refreshTokenDate = refreshTokenDate;
        await this.userRepo.save(user);

        return {
            message: 'Login is successfully',
            token: {
                accessToken,
                refreshToken
            }
        }

    }

    async register(params: RegisterDto) {
        let emailExists = await this.userRepo.findOne({ where: { email: params.email } })
        if (emailExists) throw new ConflictException('Email already exists');

        const hashedPassword = await bcrypt.hash(params.password, 10);
        if (params.password !== params.confirmPassword) throw new BadRequestException('Passwords do not match')

        let user = await this.userRepo.save({
            displayName: params.displayName,
            email: params.email,
            password: hashedPassword,
            isVerified: false,
            role: UserRole.USER,
            otpCode: generateOtpNumber(),
            otpExpiredAt: generateOtpExpireDate(),
            profile: {
                avatar: null,
                about: '',
                lastSeen: new Date(),
                status: UserStatus.OFFLINE
            }
        })

        await this.userRepo.save(user)
        await this.mailer.sendMail({
            to: params.email,
            subject: 'Verify Your Email - Chat System!',
            template: 'verify-email',
            context: {
                displayName: user.displayName,
                otpCode: user.otpCode,
            },
        });
        return { message: 'OTP sent to your email' };
    }

    async verifyOtp(params: VerifyOtpDto) {
        let user = await this.userRepo.findOne({ where: { email: params.email } })
        if (!user) throw new NotFoundException('User not found')
        if (user.isVerified) throw new BadRequestException('Account is already active');

        if (user.otpCode !== params.otpCode || !user.otpExpiredAt || new Date() > user.otpExpiredAt) throw new BadRequestException('OTP is incorrect or expired.');
        user.isVerified = true;
        user.otpCode = null;
        user.otpExpiredAt = null;

        await this.userRepo.save(user);
        return { message: 'Account successfully activated' };
    }

    async refreshToken(params: RefreshTokenDto) {
        const user = await this.userRepo.findOne({ where: { refreshToken: params.refreshToken } });
        if (!user) throw new UnauthorizedException('User not found');

        const accessToken = this.jwt.sign({ userId: user.id }, { expiresIn: '15m' });
        return { accessToken };
    }

    async resendOtp(params: ResentOtpDto) {
        const user = await this.userRepo.findOne({ where: { email: params.email } });
        if (!user) throw new NotFoundException('User not found');
        if (user.isVerified) throw new BadRequestException('Account is already verified');

        user.otpCode = generateOtpNumber();
        user.otpExpiredAt = generateOtpExpireDate();

        await this.userRepo.save(user);

        await this.mailer.sendMail({
            to: params.email,
            subject: 'Verify Your Email – Chat System!',
            template: 'verify-email',
            context: {
                displayName: user.displayName,
                otpCode: user.otpCode,
            },
        });

        return { message: 'OTP has been resent to your email' };
    }

    async resetPassword(params: ResetPasswordDto) {
        let user = this.cls.get<UserEntity>('user')

        let checkPassword = await bcrypt.compare(params.currentPassword, user.password);
        if (!checkPassword) throw new BadRequestException('Current password is wrong');

        if (params.newPassword !== params.repeatPassword) throw new BadRequestException('Passwords do not match');

        const hashedPassword = await bcrypt.hash(params.newPassword, 10)
        user.password = hashedPassword

        await this.userRepo.save(user)
        return { message: 'Password is updated successfully' };
    }

    verifyToken(token: string) {
        try {
            const decoded = this.jwt.verify(token);
            return { message: 'Token is valid', decoded };
        } catch (error) {
            throw new UnauthorizedException('Token is invalid or expired');
        }
    }
}