import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, IsNull } from 'typeorm';
import { RequestGroup } from '../request';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { formatGroupRef, formatUserRef, mongoId } from '../utils/mongo-compat';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(GroupMember)
    private grpMemberRepo: Repository<GroupMember>,
  ) {}

  async createGroup({ name, createdBy }: RequestGroup) {
    const postGroup = this.groupRepo.save(
      this.groupRepo.create({
        name,
        createdBy,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      }),
    );
    this.logger.log(`The ${name} group was created by ${createdBy}`);
    return postGroup;
  }

  async updateGroupById(
    id: string,
    updateData: RequestGroup,
  ): Promise<Group | null> {
    await this.groupRepo.update(id, {
      ...updateData,
      updatedAt: new Date(),
    });
    this.logger.log(`The ${id} Group was updated update data : ${updateData}`);
    return this.groupRepo.findOne({ where: { id } });
  }

  async deleteGroup(id: string): Promise<Group | null> {
    await this.groupRepo.update(id, { deletedAt: new Date() });
    this.logger.warn(`The ${id} Group was delete(soft delete)`);
    return this.groupRepo.findOne({ where: { id } });
  }

  async fetchGroupById(id: string) {
    const group = await this.groupRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['creator'],
    });
    this.logger.log(`The expense fetch by Id : ${id}`);
    if (!group) return [];
    return [
      {
        ...mongoId(group.id),
        name: group.name,
        user: group.creator
          ? {
              name: group.creator.name,
              email: group.creator.email,
            }
          : undefined,
      },
    ];
  }

  async fetchGroupByUserId(id: string) {
    const memberships = await this.grpMemberRepo.find({
      where: { userId: id, deletedAt: IsNull() },
    });

    const groupIds = memberships.map((member) => member.groupId);
    if (!groupIds.length) return [];

    const groups = await this.groupRepo.find({
      where: { id: In(groupIds), deletedAt: IsNull() },
      relations: ['creator'],
    });

    this.logger.log(`The group fetch by user Id : ${id}`);
    return groups.map((group) => ({
      ...mongoId(group.id),
      name: group.name,
      createdBy: group.creator
        ? {
            ...formatUserRef(group.creator),
          }
        : undefined,
    }));
  }
}
