import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupController } from './group.conroller';
import { GroupService } from './group.service';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember])],
  providers: [GroupService],
  controllers: [GroupController],
})
export class GroupModule {}
