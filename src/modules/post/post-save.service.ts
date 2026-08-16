import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostSaveEntity } from "./entities/post-save.entity";
import { Repository } from "typeorm";
import { PostEntity } from "./entities/post.entity";
import { POST_MESSAGES } from "src/shared/constants/messages/post.messages";



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
            throw new NotFoundException(POST_MESSAGES.POST_NOT_FOUND);
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
                throw new ConflictException(POST_MESSAGES.POST_ALREADY_SAVED)
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
            throw new NotFoundException(POST_MESSAGES.SAVED_POST_NOT_FOUND)
        }

        return {
            data:{
                postId,
                isSaved:false
            }
        }

    }

}