import { Funko } from "../../funkos/entities/funko.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'categorias'})
export class Categoria {
  @PrimaryColumn({ type: 'uuid'})
  id: string
  @Column({ type: 'varchar', length: 255, unique: true, nullable:false})
  nombre: string
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
  @Column({name:'is_deleted', type: 'boolean', default: false})
  isDeleted: boolean
  @OneToMany(() => Funko, (funko) => funko.categoria)
  funkos: Funko[]

}
