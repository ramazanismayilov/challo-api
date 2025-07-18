import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { ClsService } from "nestjs-cls";
import { UserRole } from "src/common/enums/role.enum";
import { UserEntity } from "src/entities/User.entity";
import { DataSource, FindOptionsWhere, ILike, Not, Repository } from "typeorm";
import { ProfileUpdateDto } from "./dto/updateProfile.dto";
import { MediaEntity } from "src/entities/Media.entity";
import { VerifyNewEmailDto } from "./dto/verifyNewEmail.dto";
import { EmailUpdateDto } from "./dto/updateEmail.dto";
import { generateOtpExpireDate, generateOtpNumber } from "src/common/utils/randomNumber.utils";
import { MailerService } from "@nestjs-modules/mailer";
import { SearchDto } from "src/common/dto/search.dto";

@Injectable()
export class UserService {
    private userRepo: Repository<UserEntity>;
    private mediaRepo: Repository<MediaEntity>;

    constructor(
        private cls: ClsService,
        private mailer: MailerService,
        @InjectDataSource() private dataSource: DataSource
    ) {
        this.userRepo = this.dataSource.getRepository(UserEntity);
        this.mediaRepo = this.dataSource.getRepository(MediaEntity);
    }

    async getUsers() {
        const currentUser = this.cls.get<UserEntity>('user');
        if (currentUser.role !== UserRole.ADMIN) throw new ForbiddenException('You do not have permission for this operation');

        let users = await this.userRepo.find({ relations: ['profile', 'profile.avatar'] });
        if (!users || users.length === 0) throw new NotFoundException('Users not found');

        return users;
    }

    async getChatUsers(query: SearchDto) {
        let currentUser = this.cls.get<UserEntity>('user')
        const where: FindOptionsWhere<UserEntity> = { isVerified: true, id: Not(currentUser.id), };
        if (query.search) where.displayName = ILike(`%${query.search}%`);

        const chatUsers = await this.userRepo.find({ where, relations: ['profile', 'profile.avatar'] });
        if (!chatUsers || chatUsers.length === 0) throw new NotFoundException('Users not found');

        const users = chatUsers.map(item => ({
            id: item.id,
            displayName: item.displayName,
            about: item.profile.about,
            avatar: item.profile.avatar?.url || null,
        }));

        return { data: users };
    }

    async getChatUserId(userId: number) {
        let user = await this.userRepo.findOne({ where: { id: userId }, relations: ['profile', 'profile.avatar'] });
        if (!user) throw new NotFoundException('User not found');

        const userData = {
            id: user.id,
            displayName: user.displayName,
            about: user.profile.about,
            avatar: user.profile.avatar?.url || null,
        };
        return { data: userData };
    }

    async getUser(userId: number) {
        let user = await this.userRepo.findOne({ where: { id: userId }, relations: ['profile', 'profile.avatar'] });
        if (!user) throw new NotFoundException('User not found')
        return user
    }

    async getMyProfile() {
        const user = this.cls.get<UserEntity>('user');
        const myProfile = await this.userRepo.findOne({
            where: { id: user.id }, relations: ['profile', 'profile.avatar']
        });

        if (!myProfile) throw new NotFoundException('User not found');
        let newProfile = {
            displayName: myProfile.displayName,
            email: myProfile.email,
            avatar: myProfile.profile.avatar,
            about: myProfile.profile.about
        }
        return newProfile
    }

    async updateProfile(params: ProfileUpdateDto) {
        const user = await this.userRepo.findOne({
            where: { id: this.cls.get<UserEntity>('user').id },
            relations: ['profile', 'profile.avatar']
        });

        if (!user) throw new NotFoundException('User not found');

        if (params.displayName) user.displayName = params.displayName;
        if (params.about) user.profile.about = params.about;

        if (params.avatarId) {
            const avatar = await this.mediaRepo.findOne({ where: { id: params.avatarId } });
            if (!avatar) throw new NotFoundException('Media not found');
            user.profile.avatar = avatar;
        }

        await this.userRepo.save(user);
        return { message: 'Profile updated successfully', user };
    }

    async updateEmail(params: EmailUpdateDto) {
        const user = await this.userRepo.findOne({ where: { id: this.cls.get<UserEntity>('user').id }, relations: ['profile'] });
        if (!user) throw new NotFoundException('User not found');
        if (params.email === user.email) throw new ConflictException('This is already your current email');

        const emailExists = await this.userRepo.findOne({ where: { email: params.email } });
        if (emailExists) throw new ConflictException('This email is already taken');

        user.pendingEmail = params.email;
        user.otpCode = generateOtpNumber();
        user.otpExpiredAt = generateOtpExpireDate();

        await this.mailer.sendMail({
            to: params.email,
            subject: 'Confirm Your New Email - Challo!',
            template: 'verify-email',
            context: {
                displayName: user.displayName,
                otpCode: user.otpCode,
            },
        });

        await this.userRepo.save(user);
        return { message: 'OTP sent to your new email address' };
    }

    async verifyNewEmail(params: VerifyNewEmailDto) {
        const user = await this.userRepo.findOne({ where: { pendingEmail: params.email } });
        if (!user) throw new NotFoundException('User not found');

        if (!user.otpExpiredAt || new Date() > user.otpExpiredAt) {
            user.otpCode = null;
            user.otpExpiredAt = null;
            user.pendingEmail = null;
            await this.userRepo.save(user);
            throw new BadRequestException('OTP is expired.');
        }

        if (user.otpCode !== params.otpCode) throw new BadRequestException('OTP is incorrect.');

        user.email = user.pendingEmail!;
        user.pendingEmail = null;
        user.otpCode = null;
        user.otpExpiredAt = null;

        await this.userRepo.save(user);
        return { message: 'Email successfully updated' };
    }

    async deleteUser(userId: number) {
        const currentUser = this.cls.get<UserEntity>('user');

        const userToDelete = await this.userRepo.findOne({ where: { id: userId } });
        if (!userToDelete) throw new NotFoundException('User not found');

        if (currentUser.role === UserRole.ADMIN) {
            await this.userRepo.remove(userToDelete);
            return { message: 'User has been successfully deleted' };
        }

        if (currentUser.id !== userId) throw new ForbiddenException({ message: 'You can only delete your own account' });

        await this.userRepo.remove(userToDelete);
        return { message: 'Your account has been successfully deleted' };
    }
}