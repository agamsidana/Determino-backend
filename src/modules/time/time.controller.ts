import { Controller, Get } from '@nestjs/common';

@Controller('time')
export class TimeController {

    @Get()
    getServerTime() {

        return {
            data: {
                serverTime: new Date().toISOString(),
            },
        };

    }


}
