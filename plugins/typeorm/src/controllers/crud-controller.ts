/**
 * @license
 * Copyright Andrey Chalkin <L2jLiga@gmail.com> (https://github.com/L2jLiga). All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/L2jLiga/fastify-decorators/blob/master/LICENSE
 */

import { addHandler, decorateController } from 'fastify-decorators/plugins';
import type { DataSource, ObjectType } from 'typeorm';
import { entityMetadataMapper } from '../mappers/entity-to-json-schema.js';
import { crudHandlersConfiguration, crudHandlersFactory } from './crud-handlers-factory.js';

export function CrudController<Entity>(entity: ObjectType<Entity>, route = `/${entity.name}`): ClassDecorator {
  return decorateController(route, (target, instance) => {
    if (!instance.hasDecorator('dataSource')) throw new Error('"dataSource" not found, did you decorate FastifyInstance with it?');
    // @ts-expect-error we just checked it above
    const dataSource = instance.dataSource as DataSource;

    const entitySchema = entityMetadataMapper(instance, dataSource.getMetadata(entity));

    Object.defineProperties(target.prototype, crudHandlersFactory(entitySchema));

    crudHandlersConfiguration(entitySchema).forEach((handler) => addHandler(target, handler));
  });
}
