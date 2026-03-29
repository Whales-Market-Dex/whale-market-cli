import axios from 'axios';
import { getLzStatus } from '../src/commands/helpers/layerzero';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getLzStatus', () => {
  it('returns DELIVERED when API says so', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [{ status: 'DELIVERED' }] },
    });
    const status = await getLzStatus('0xabc123');
    expect(status).toBe('DELIVERED');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://scan.layerzero-api.com/v1/messages/tx/0xabc123'
    );
  });

  it('returns INFLIGHT when bridge is in flight', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [{ status: 'INFLIGHT' }] },
    });
    const status = await getLzStatus('0xdef456');
    expect(status).toBe('INFLIGHT');
  });

  it('returns UNKNOWN when data is empty', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: [] },
    });
    const status = await getLzStatus('0x000');
    expect(status).toBe('UNKNOWN');
  });
});
