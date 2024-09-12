import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { Wallet } from "./wallet";

@Entity()
export class Donation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Wallet)
  @JoinColumn()
  fromWallet: number;

  @ManyToOne(() => Wallet)
  @JoinColumn()
  toWallet: number;

  @Column()
  amount: number;

  @Column()
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
