import pkg from 'sequelize';
const { Sequelize, DataTypes } = pkg;
//import  sequelize  from "../db/conexion.js";
import { sequelize } from "../db/conexion.js";

export const TypeUsersModel = sequelize.define("typeusers",{
    id:{
        autoIncrement:true,
        primaryKey:true,
        type: DataTypes.INTEGER,
    },
    type:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    imagen :{
        type: DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
},
{
    timestamps:false
}
)
