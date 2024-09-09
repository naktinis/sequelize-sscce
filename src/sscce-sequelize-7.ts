import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, NotNull } from '@sequelize/core/decorators-legacy';
import { createSequelize7Instance } from '../dev/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 7

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize7Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // Setting this to 'true' breaks the test
      underscored: true,
    },
  });

  class Foo extends Model<InferAttributes<Foo>, InferCreationAttributes<Foo>> {
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.DATE)
    declare createdAt: CreationOptional<Date>;

    @Attribute(DataTypes.DATE)
    declare updatedAt: CreationOptional<Date>;
  }

  sequelize.addModels([Foo]);

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: true });
  expect(spy).to.have.been.called;

  const foo = await Foo.create({ name: 'TS foo' });
  expect(await Foo.count()).to.equal(1);

  // Update the `createdAt` and `updatedAt` fields
  await Foo.upsert({
    id: foo.id,
    name: 'TS foo updated',
    createdAt: new Date('1990-01-01'),
    updatedAt: new Date('1990-01-02'),
  });

  // Check if the `createdAt` and `updatedAt` fields are updated
  const fooFetched = await Foo.findByPk(foo.id);
  expect(fooFetched?.createdAt).to.eql(new Date('1990-01-01'));
  expect(fooFetched?.updatedAt).to.eql(new Date('1990-01-02'));
}
