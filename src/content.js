import {readPublicContact} from './contact.js';

export const publicContact=readPublicContact(import.meta.env);
export const profile={
 name:'The Woodland Cabin',role:'Projects, notes & tools',
 bio:'A collection of desktop companions, community tools, and applications that work with language models.',
 email:'',resume:'',links:[],
 skills:[{name:'TypeScript & JavaScript',evidence:'Community tools and web interfaces.'},{name:'Python & Flask',evidence:'Web applications and retrieval pipelines.'},{name:'C++ & SDL2',evidence:'Animated desktop interfaces.'},{name:'Retrieval & language models',evidence:'Semantic search, BM25, and model reranking.'}],
 projects:[
 {name:'SinceLastTime',tags:['TypeScript','Twitch','Community'],description:'A community board that helps streamers keep up with the people behind the chat.',detail:'Viewers share updates. A conversation studio supports catch-ups, while an OBS overlay brings approved stories onto the stream. Moderation and broadcast consent are part of the workflow.'},
 {name:'Project Blob',tags:['Python','C++','SDL2'],description:'A small desktop companion with a memory, expressive eyes, and tools to help with everyday work.',detail:'A desktop interface pairs a C++/SDL2 character with a Python backend. Features include contextual memory, selected-document assistance, reminders, and optional screen awareness controlled by the user.',image:'./assets/project-blob.png',imageAlt:'Desktop companion character expressions'},
 {name:'HumanResumeFilter',tags:['Python','Flask','Retrieval'],description:'A web application and command-line pipeline for matching candidate profiles against a job description.',detail:'The pipeline combines semantic search with BM25 keyword retrieval and optional language-model reranking. The web interface supports input uploads and configurable retrieval settings.'}
 ]
};
