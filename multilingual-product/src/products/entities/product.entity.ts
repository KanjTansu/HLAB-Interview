import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ProductTranslation } from './product-translations.entity';

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    sku: string;

    @OneToMany(() => ProductTranslation, (translation) => translation.product, { cascade: true })
    translations: ProductTranslation[];

    @CreateDateColumn({ type: 'timestamptz' })
    readonly createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    readonly updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt: Date;
}
