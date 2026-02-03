import { IApiMatch } from '@/types';
import { IMathcApi } from '..';
import axios from 'axios';
import { Logger } from '@nestjs/common';

export default class OddsApiService implements IMathcApi {
  private readonly api_key = process.env.MATCH_API_KEY ?? '';
  private readonly logger = new Logger(OddsApiService.name);
  public async getMatches(): Promise<IApiMatch[]> {
    try {
      const leagues = await this.getSoccerLeagues();
      const allMatches: IApiMatch[] = [];
      for (const league of leagues) {
        try {
          const { data } = await axios.get(
            `https://api.the-odds-api.com/v4/sports/${league.key}/scores/?apiKey=${this.api_key}`,
          );
          allMatches.push(...data);
        } catch (err) {
          console.error(
            `Erro ao buscar ${league.title}`,
            err.response?.data ?? err.message,
          );
        }
      }
      return allMatches;
    } catch (error) {
      this.logger.fatal(error);
      return [];
    }
  }

  private async getSoccerLeagues() {
    const { data } = await axios.get(
      `https://api.the-odds-api.com/v4/sports/?apiKey=${this.api_key}`,
    );
    const soccerLeagues = data.filter((s: any) => s.group === 'Soccer');
    return soccerLeagues;
  }
}
