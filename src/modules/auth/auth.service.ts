import { MailerService } from "@nestjs-modules/mailer";
import { ConflictException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserEntity } from "src/entities/User.entity";
import { DataSource, Repository } from "typeorm";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from 'bcrypt';
import { UserRole } from "src/common/enums/role.enum";
import { generateOtpExpireDate, generateOtpNumber } from "src/common/utils/randomNumber.utils";

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

    async login() { }

    async register(params: RegisterDto) {
        let emailExists = await this.userRepo.findOne({ where: { email: params.email } })
        if (emailExists) throw new ConflictException('Email already exists');

        const hashedPassword = await bcrypt.hash(params.password, 10);

        let user = await this.userRepo.save({
            email: params.email,
            password: hashedPassword,
            isVerified: false,
            role: UserRole.USER,
            otpCode: generateOtpNumber(),
            otpExpiredAt: generateOtpExpireDate(),
        })

        await this.userRepo.save(user)
        await this.mailer.sendMail({
            to: params.email,
            subject: 'Verify Your Email',
            template: 'verify-email',
            context: {
                email: user.email,
                otpCode: user.otpCode,
            },
        });
        return { message: 'OTP sent to your email.' };
    }

    async verifyOtp() { }

    async refreshToken() { }

    async resendOtp() { }

    async resetPassword() { }

    async verifyToken() { }
}