import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { title } from 'process';

@Injectable()
export class SubforumService {
    private prisma = new PrismaClient();

    async getSpecificTopicById(subid: number, topid:number) {
        const pic = await this.prisma.topic.findFirst({
            where: {
                id: topid,
                subforumId:subid
            },
            select: {
                id:true,
                title:true,
                description:true,
                createdAt:true,
                labels:true,
                comments: {
                    where: {topicId:topid},
                    select: {
                        id:true,
                        forReplyId:true,
                        text:true,
                        media:true,
                        createdAt:true,
                        replyToId:true,
                        support:true,
                        reject:true
                    },
                    orderBy:{createdAt:"desc"}
                }
            },
            orderBy:{createdAt:"desc"}
        })

        if (!pic) {
            throw new NotFoundException("no such topic");
        }

        const commentMap = new Map();
        const rootComments = [];

        pic.comments.forEach((cc)=>{
            commentMap.set(cc.forReplyId,{...cc, replies: []})
        });

        pic.comments.forEach((cc)=>{
            if (cc.replyToId) {
                const parent = commentMap.get(cc.replyToId);
                if (parent) {
                    parent.replies.unshift(commentMap.get(cc.replyToId));
                }
            } else {
                rootComments.push(commentMap.get(cc.forReplyId));
            }
        });

        // return {...pic, comments:rootComments};
        return pic;
    }

    async getFilterSubforumAllRelated(id:number, labels: string[], topicName?: string) {
        const filtered = await this.prisma.subforum.findUnique({
            where: {id:id},
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                topics: {
                    where: {
                        AND: [
                            title ? {title:{contains:topicName}}:{},
                            labels ? {labels:{some:{name:{in:labels}}}}:{}
                        ],
                    },
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        description: true,
                        labels: true,
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        })

        return filtered;
    }

    async getSubForumByItsId(id:number) {
        const thatSubForum = await this.prisma.subforum.findUnique({
            where: {id},
            select: {
                id:true,
                name:true,
                description:true,
                createdAt:true,
                topics: {
                    select:{
                        id:true,
                        title:true,
                        createdAt:true,
                        description:true,
                        labels: true,
                    },
                    orderBy: {createdAt:"desc"}
                }
            },
        })

        if (!thatSubForum) {
            throw new NotFoundException("no such subforum");
        }
        return thatSubForum;
    }

    async getAllSubForums() {
        return this.prisma.subforum.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAllSubForumsThatFitFilter(
        name?: string,
        createdAt?: Date
    ) {
        return this.prisma.subforum.findMany({
            where: {
                AND: [
                    name ? {name:{contains:name}}:{},
                    createdAt ? {createdAt: { gte: createdAt }}:{}
                ]
            },
            select: {
                id:true,
                name:true,
                description:true,
                createdAt:true
            },
            orderBy:{createdAt:"desc"}
        });
    }

    async createOneSubForum(name:string, description:string) {
        const existingSubforum = await this.prisma.subforum.findMany({
            where: {name:name}
        });
        if (existingSubforum.length>0) {
            throw new ConflictException('Subforum with this name already exists');
        }
        return this.prisma.subforum.create({
            data: {
                name:name,
                description:description,
                forum: {
                    connect: {id:1}
                }
            }
        })
    }
}
