import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { EntityRepository, Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

@EntityRepository(User)
export class UserRepository extends Repository<User>{
    async signUp(authCredentialsDto:AuthCredentialsDto):Promise<void> {
        const { username, password } = authCredentialsDto;

        // This line for creation of user entity is not testable as we are creating object here and it can not be mocked.
        // const user = new User();

        // So we create it in this manner
        const user = this.create();

        user.username = username;
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password,user.salt);
        try {
            await user.save();
        } catch ( error ) {
            if ( error.code === '23505' ) { // error code for duplicate usernames
                console.log(error.code);
                throw new ConflictException( 'Username already exists.' );
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async validateUserPassword( authCredentialsDto: AuthCredentialsDto ) {
        const { username, password } = authCredentialsDto;
        const user = await this.findOne( { username } );

        if ( user && await user.validatePassword( password ) ) {
            return user.username;
        } else {
            return null;
        }
    }

    private async hashPassword( password: string, salt: string ):Promise<string> {
        return bcrypt.hash( password, salt );
    }
}
