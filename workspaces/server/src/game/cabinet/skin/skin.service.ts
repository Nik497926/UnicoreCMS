import { ForbiddenException, Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { MulterFile } from 'fastify-file-interceptor';
import { matchPermission } from 'src/admin/roles/guards/permisson.guard';
import { Permission } from 'unicore-common';
import sizeOf from 'image-size';
import { StorageManager } from '@common';
import { Repository } from 'typeorm';
import { Skin } from './entities/skin.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cloak } from './entities/cloak.entity';
import { User } from 'src/admin/users/entities/user.entity';
import { UsersService } from 'src/admin/users/users.service';

@Injectable()
export class SkinService {
  constructor(
    @InjectRepository(Skin)
    private skinsRepository: Repository<Skin>,
    @InjectRepository(Cloak)
    private cloaksRepository: Repository<Cloak>,
    private usersService: UsersService
  ) {}

  async updateSkin(user: User, file: MulterFile) {
    let skin = (await this.skinsRepository.findOne(user.uuid)) || new Skin();

    if (skin.file) StorageManager.remove(skin.file);

    skin.user = user;
    skin.file = file.filename;

    return this.skinsRepository.save(skin);
  }

  async updateSkinMe(req: any, file: MulterFile) {
    const { width, height } = sizeOf(StorageManager.read(file.filename));

    if (width > 2048 || height > 2048) {
      StorageManager.remove(file.filename);
      throw new UnsupportedMediaTypeException();
    }

    if ((width > 64 || height > 64) && !await matchPermission([Permission.UserCabinetSkinHd], req)) {
      StorageManager.remove(file.filename);
      throw new ForbiddenException();
    }

    return this.updateSkin(req.user, file);
  }

  async updateSkinByUUID(uuid: string, file: MulterFile) {
    const user = await this.usersService.getById(uuid)
    if (!user) throw new NotFoundException()

    return this.updateSkin(user, file)
  }

  async updateCloak(user: User, file: MulterFile) {
    let cloak = (await this.cloaksRepository.findOne(user.uuid)) || new Cloak();

    if (cloak.file) StorageManager.remove(cloak.file);

    cloak.user = user;
    cloak.file = file.filename;

    return this.cloaksRepository.save(cloak);
  }

  async updateCloakMe(req: any, file: MulterFile) {
    const { width, height } = sizeOf(StorageManager.read(file.filename));

    if (width > 2048 || height > 2048) {
      StorageManager.remove(file.filename);
      throw new UnsupportedMediaTypeException();
    }

    if ((width > 64 || height > 64) && !await matchPermission([Permission.UserCabinetCloakHd], req)) {
      StorageManager.remove(file.filename);
      throw new ForbiddenException();
    }

    return this.updateCloak(req.user, file)
  }

  async updateCloakByUUID(uuid: string, file: MulterFile) {
    const user = await this.usersService.getById(uuid)
    if (!user) throw new NotFoundException()

    return this.updateCloak(user, file)
  }

  async removeCloak(user: User) {
    if (!user.cloak) return;

    let cloak = await this.cloaksRepository.findOne(user.uuid);
    cloak.user = user;

    if (cloak) this.cloaksRepository.remove(cloak);
  }

  async removeCloakByUUID(uuid: string) {
    const user = await this.usersService.getById(uuid)
    if (!user) throw new NotFoundException()

    return this.removeCloak(user)
  }

  async removeSkin(user: User) {
    if (!user.skin) return;

    let skin = await this.skinsRepository.findOne(user.uuid);
    skin.user = user;

    if (skin) this.skinsRepository.remove(skin);
  }

  async removeSkinByUUID(uuid: string) {
    const user = await this.usersService.getById(uuid)
    if (!user) throw new NotFoundException()

    return this.removeSkin(user)
  }
}
