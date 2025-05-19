declare var console: any;
declare function fetch(input: any, init?: any): Promise<any>;
declare var process: any;
declare var require: any;
declare var module: any;

declare namespace Reflect {
  function getMetadata(key: any, target: any, propertyKey?: string | symbol): any;
  function defineMetadata(key: any, value: any, target: any, propertyKey?: string | symbol): void;
}

declare module 'reflect-metadata';
declare module 'dotenv';
