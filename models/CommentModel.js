import pkg from 'sequelize';
const { Sequelize, DataTypes } = pkg;
import { sequelize } from "../db/conexion.js";
//import  sequelize  from "../db/conexion.js";
import {UserModel}   from "./UserModel.js";

//aqui se laque la llave 
export const CommentModel = sequelize.define(
  "comments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
   
    state: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      movie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      
  },
  {
    timestamps: false,
  }
);
///esto lo puse yo


UserModel.hasMany(CommentModel, { foreignKey: "user_id" });
CommentModel.belongsTo(UserModel, { foreignKey: "user_id" });
