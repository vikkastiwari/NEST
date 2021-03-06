import { User } from './../auth/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-filtered-tasks.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTaskFilterDto, user:User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterDto,user);
  }

    async getTaskById( id: number, user ): Promise<Task> {

    // we are quering ID with respect to user
    const found = await this.taskRepository.findOne( {where:{id,userId:user.id}} );

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

    async createTask(createTaskDto: CreateTaskDto, user:User): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto,user);
    }

  async deleteTask(id: number, user:User): Promise<void> {
    const result = await this.taskRepository.delete({id,userId:user.id});

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus, user:User): Promise<Task> {
    const task = await this.getTaskById(id,user);
    task.status = status;
    await task.save();
    return task;
  }
}