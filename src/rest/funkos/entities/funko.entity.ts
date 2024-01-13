import { Categoria } from "../../categorias/entities/categoria.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "funkos"})
export class Funko {
  public static IMAGE_DEFAULT = 'https://via.placeholder.com/150';
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;
  @Column({type: 'varchar', length: 255, nullable:false})
  nombre: string;
  @Column({type: 'double precision', default: 0.0})
  precio: number;
  @Column({type: 'integer', default: 0})
  cantidad: number;
  @Column({type: 'text', default: Funko.IMAGE_DEFAULT})
  imagen: string
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
  @Column({name:'is_deleted', type: 'boolean', default: false})
  isDeleted: boolean;
  @ManyToOne(() => Categoria, (categoria) => categoria.funkos)
  @JoinColumn({name: 'categoria_id'})
  categoria: Categoria;
}

