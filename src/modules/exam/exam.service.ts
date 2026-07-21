import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamEntity } from './entities/exam.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ExamResponseDto } from './dto/exam-response.dto';

@Injectable()
export class ExamService {

    constructor(@InjectRepository(ExamEntity) private examRepository: Repository<ExamEntity>) { }

    async findAll(search?: string): Promise<ExamResponseDto> {

        const where: FindOptionsWhere<ExamEntity> = {
            isActive: true
        }

        if (search?.trim()) {
            where.name = ILike(`%${search.trim()}%`);
        }

        const exams = await this.examRepository.find({
            where,
            order: {
                isPopular: 'DESC',
                name: 'ASC'
            }
        });

        const examsResponse = exams.map((exam) => ({
            id: exam.id,
            name: exam.name,
            icon: exam.icon,
            iconColor: exam.iconColor,
            isPopular: exam.isPopular,
            isActive: exam.isActive
        }));

        return {
            data: examsResponse,
        };
    }

    async findExamById(id: string): Promise<ExamEntity | null> {
        const exam = await this.examRepository.findOne({
            where: {
                id,
                isActive: true
            },
        });
        return exam;
    }

    async findPopular(): Promise<ExamResponseDto> {

        const exams = await this.examRepository.find({
            where: {
                isActive: true,
                isPopular: true,
            },
            order: {
                name: "ASC",
            },
        });

        const examsResponse = exams.map((exam) => ({
            id: exam.id,
            name: exam.name,
            icon: exam.icon,
            iconColor: exam.iconColor,
            isPopular: exam.isPopular,
            isActive: exam.isActive
        }));

        return {
            data: examsResponse,
        };

    }



}
