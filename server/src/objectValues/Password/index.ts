import bcrypt from 'bcrypt';

export class Password {
  hash(text: string) {
    return bcrypt.hashSync(text, 10);
  }

  public compare(hash: string, text: string) {
    return bcrypt.compareSync(text, hash);
  }
}
