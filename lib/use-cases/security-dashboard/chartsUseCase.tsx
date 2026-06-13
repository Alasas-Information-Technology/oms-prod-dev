import { SecurityRepository } from "@/lib/repositories/SecurityRepository";

export class GetFailedLoginsUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {

        return await this.securityRepository
            .failedLoginChartData();
    }
}

export class SecurityEventsByTypeUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {

        return await this.securityRepository
            .securityEventsByTypeChartData();
    }
}

export class SessionsByDeviceUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {
        return await this.securityRepository.sessionsByDeviceChartData();
    }
}

export class SessionsByRoleUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {
        return await this.securityRepository.sessionsByRoleChartData();
    }
}

export class LoginTrendUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {
        return await this.securityRepository.loginTrendChartData();
    }
}

export class ReplayEventsUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {
        return await this.securityRepository.replayEventsChartData();
    }
}

export class LockedAccountsUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {
        return await this.securityRepository.lockedAccountsChartData();
    }
}

export class SessionsCreatedPerDayUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute() {
        return await this.securityRepository.sessionsCreatedPerDayChartData();
    }
}