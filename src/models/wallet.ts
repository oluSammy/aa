import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  balance: number;

  @Column({ nullable: true, default: null })
  pin: string;

  @OneToOne((type) => User)
  @JoinColumn()
  user: number;
}
