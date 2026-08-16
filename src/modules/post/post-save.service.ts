import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSaveEntity } from "./entities/post-save.entity";
import { Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";



@Injectable()
export class PostSaveService{

    constructor(@InjectRepository(PostSaveEntity) private readonly postSaveRepository:Repository<PostSaveEntity>,@InjectRepository(PostEntity) private readonly postRepository:Repository<PostEntity>){}

    async savePost(postId:string,userId:string){

        const post = await this.postRepository.findOne({
            where:{
                id:postId,
                isDeleted:false
            }
        });

        if(!post){
            throw new NotFoundException('post not found');
        }

        const postSave=this.postSaveRepository.create({
            post:{id:postId},
            user:{id:userId}
        });

        try{
            await this.postSaveRepository.save(postSave);
        }
        catch(err:any){
            if(err.code === '23505'){
                throw new ConflictException('post alread saved')
            }
            
            throw err;
        }

        return {
            data:{
                postId,
                isSaved:true
            }
        }

    }

    async unsavePost(postId:string,userId:string){

        const result = await this.postSaveRepository.delete({
            post:{id:postId},
            user:{id:userId}
        });

        if(result.affected === 0){
            throw new NotFoundException('saved post not found')
        }

        return {
            data:{
                postId,
                isSaved:false
            }
        }

    }

}