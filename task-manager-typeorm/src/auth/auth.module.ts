import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { UserRepository } from './user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import * as config from 'config';

const jwtConfig = config.get( 'jwt' );

@Module({
    imports: [
        // passport js is configured with jwt token
        PassportModule.register( {
            defaultStrategy:'jwt'
        }),

        JwtModule.register({
            secret:process.env.JWT_SECRET || jwtConfig.secretOrKey,
            signOptions: {
                expiresIn:jwtConfig.expiresIn,
            },
        }),
        
        // user repository is available for injection throughout the module
        TypeOrmModule.forFeature([UserRepository])  
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    // It can now be used in other modules as well for guarding other operations
    exports:[JwtStrategy, PassportModule],
})
export class AuthModule {}
