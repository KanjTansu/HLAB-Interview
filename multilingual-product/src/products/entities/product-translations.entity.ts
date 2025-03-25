import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'product_translations' })
@Index(['product', 'languageCode'], { unique: true })
export class ProductTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'language_code', type: 'varchar', length: 5 })
    languageCode: string;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string;

    @Column({ name: 'description', nullable: true, type: 'text' })
    description: string;

    @ManyToOne(() => Product, (product) => product.translations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
    product: Product;
}
