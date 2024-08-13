import { Profile } from "../../profile/model/profile.model"
import { LoginToken } from "../../profile/profile-telegram.service"
import { ServiceProvider } from "./services.provider"
import { Wizard, WizardStep } from "./wizard"


export class ProfileWizard extends Wizard {

    protected profile: Profile

    constructor(profile: Profile, services: ServiceProvider) {
        super(Number(profile.telegramChannelId), services)
        this.profile = profile
    }

    private error: any

    private _loginToken?: LoginToken

    public getProfile(): Profile {
        return this.profile
    }


    public getSteps(): WizardStep[] {
        return [{
            order: 0,
            message: [
                `Welcome to Unity Management`,
                `your name: ${this.profile?.name}`,
            ],
            buttons: [[{
                text: 'Login page',
                url: this.prepareLoginUrl()
            }]], 
        }, {
            order: 1,
        }, {
            order: 2,
            message: [this.error],
            close: true
        }, {
            order: 3,
        }, {
            order: 4,
            message: [`Are you sure?`],
            buttons: [[{
                text: `No`,
                process: async () => 0
            }, {
                text: `Yes`,
                process: () => this.deleteAccount()
            }]]
        }, {
            order: 5,
            message: [`Your profile deleted successfully`],
            close: true
        }]
    }


    private prepareLoginUrl(): string {
        return `${process.env.FRONT_APP_URL}/login`
    }

    private async deleteAccount() {
        try {
            await this.services.profileTelegramService.deleteByTelegram(this.profile)
            return 5
        } catch (error) {
            this.error = error
            this.logger.error(error)
            return 2
        }
    }



}