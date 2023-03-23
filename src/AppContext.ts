import { NextContext } from "fastapi-next";
import { JWTController } from "fastapi-next/build/ts-types/security/JWT/JWTController";
import { Knex } from "knex";
import { MongoClient } from "mongodb";
import { Application, ServiceUser, UserApplication } from './apidb/tables';

export interface AppSession {
  user?: any;
  granted?: boolean;
  token?: string;
}


export interface AppContext<T = any> extends NextContext<T> {
  session: AppSession;
  db:Knex;
  voiceHubDb:MongoClient;
  jwt: JWTController;
}