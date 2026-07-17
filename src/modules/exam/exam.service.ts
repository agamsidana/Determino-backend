import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamEntity } from './entities/exam.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExamService {

    constructor(@InjectRepository(ExamEntity) private examRepository: Repository<ExamEntity>) { }

    async findAll() {
        const exams = await this.examRepository.find({
            where:{
                isActive:true
            }
        });
        return exams;
    }

    async findExamById(id:string) {
        const exam= await this.examRepository.findOneBy({id});
        return exam;
    }



}
