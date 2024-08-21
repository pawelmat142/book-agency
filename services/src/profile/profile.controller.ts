import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { LoginToken, ProfileTelegramService } from './profile-telegram.service';
import { LoginForm, ProfileEmailService } from './profile-email.service';
import { ProfileService } from './profile.service';
import { JwtGuard } from './auth/jwt.guard';
import { Serialize } from '../global/interceptors/serialize.interceptor';
import { ProfileDto } from './model/profile.dto';
import { GetProfile } from './auth/profile-path-param-getter';
import { JwtPayload } from './auth/jwt-strategy';
import { Profile } from './model/profile.model';
import { LogInterceptor } from '../global/interceptors/log.interceptor';

@Controller('api/profile')
@UseInterceptors(LogInterceptor)
export class ProfileController {

    constructor(
        private readonly profileTelegramService: ProfileTelegramService,
        private readonly profileEmailService: ProfileEmailService,
        private readonly profileService: ProfileService,
    ) {}


    @Get('full')
    @UseGuards(JwtGuard)
    @Serialize(Profile)
    fetchFullProfile(@GetProfile() payload: JwtPayload) {
        return this.profileService.fetchFullProfile(payload)
    }

    @Get('managers')
    @UseGuards(JwtGuard)
    @Serialize(ProfileDto)
    fetchManagers() {
        return this.profileService.fetchManagers()
    }


    // TELEGRAM
    @Get('telegram')
    fetchTelegramBotHref() {
        return { url: `tg://resolve?domain=${process.env.TELEGRAM_BOT_NAME}`}
    }

    @Get('telegram/pin/:id')
    telegramPinRequest(@Param('id') uidOrNameOrEmail: string) {
        return this.profileTelegramService.telegramPinRequest(uidOrNameOrEmail)
    }

    @Post('login/pin')
    loginByPin(@Body() body: Partial<LoginToken>) {
        return this.profileTelegramService.loginByPin(body)
    }

    @Get('refresh-token')
    @UseGuards(JwtGuard)
    refreshToken(@GetProfile() profile: JwtPayload) {
        return this.profileService.refreshToken(profile)
    }


    //EMAIL
    @Post('email/register')
    createProfileEmail(@Body() body: LoginForm) {
        return this.profileEmailService.createProfile(body)
    }

    @Post('email/login')
    loginByEmail(@Body() body: Partial<LoginForm>) {
        return this.profileEmailService.loginByEmail(body)
    }

}
